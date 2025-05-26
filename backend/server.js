import express from "express"
import mongoose from "mongoose";
import bcrypt from "bcryptjs"
import jwt from 'jsonwebtoken'
import cors from "cors"

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your_jwt_secret';

// connect MongoDB
mongoose.connect('mongodb+srv://suyashgoyal874:aivQPViySfv5BjTR@cluster0.ierckzb.mongodb.net/', {
        dbName: "hospital_management_syst",
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});
const User = mongoose.model('User', UserSchema);

const AppointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    reason: String,
    status: { type: String, default: 'booked' },
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};


app.post('/api/users/register', async(req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ message: 'User registered' });
});

// user Login
app.post('/api/users/login', async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

// Book Appointment
app.post('/api/appointments', auth, async(req, res) => {
    const { date, reason } = req.body;

    const appointment = new Appointment({
        userId: req.user.userId,
        date,
        reason,
    });

    await appointment.save();
    res.json({ message: 'Appointment booked', appointment });
});


app.delete('/api/appointments/:id', auth, async(req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not allowed' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled' });
});



app.get('/api/appointments', auth, async(req, res) => {
    const appointments = await Appointment.find({ userId: req.user.userId });
    res.json(appointments);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));