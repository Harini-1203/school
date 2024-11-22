const express=require("express");
const app=express();
app.use(express.json());
require("dotenv").config();



const dbCon=require('./config/createCon')
dbCon.connect((err)=>{
    if(err) {console.log(err); 
        return;
    }
    console.log("connected to db");
});

app.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || !latitude || !longitude) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'lat and long must be numbers' });
    }

    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    dbCon.query(query, [name, address, latitude, longitude], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'School added successfully' });
    });
});
app.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    // Input validation
    if (!latitude || !longitude) {
        return res.status(400).json({ message: 'lat and long are required' });
    }
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'lat and long must be numbers' });
    }

    const query = 'SELECT * FROM schools';
    dbCon.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching schools:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }

        const userLat = parseFloat(latitude);
        const userLon = parseFloat(longitude);
        const schoolsWithDistance = results.map((school) => {
            const distance = Math.sqrt(
                Math.pow(school.latitude - userLat, 2) + Math.pow(school.longitude - userLon, 2)
            );
            return { ...school, distance };
        });

        schoolsWithDistance.sort((a, b) => a.distance - b.distance);
        res.json(schoolsWithDistance);
    });
});


app.listen(process.env.PORT,()=>{
    console.log(`on port ${process.env.PORT}`);
})
