const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('YOUR_MONGO_CONNECTION_STRING')
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Define a schema for the email
const emailSchema = new mongoose.Schema({
    from: String,
    to: String,
    subject: String,
    message: String
});

// Create a model from the schema
const Email = mongoose.model('Emails', emailSchema, "mails");

app.post("/callback", function(req, res){
    console.log("success"+JSON.stringify(req.body))
    res.json({info:"new_message", data:req.body});
})

// POST request to save email
app.post('/emails', async (req, res) => {
    const { from, to, subject, message, callbackUrl } = req.body;

    try {
        // Save email to MongoDB
        console.log("insides")
        const email = new Email({ from, to, subject, message });
        await email.save();

        // Send webhook notification
        const notification = {
            message: 'New email available',
            emailId: email._id
        };
        
        const ress = await axios.post(callbackUrl, notification);
        res.status(201).json({"status":"success", data:notification});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
