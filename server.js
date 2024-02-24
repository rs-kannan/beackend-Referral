const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const PORT = 6700 || process.env.PORT;
const app = express();
const connectDB = require('./Config/db');
const authroutes = require('./Routes/UserRoutes');
//const Recepieroutes = require('./Routes/RecepieRoutes');

//Configrations
dotenv.config();
connectDB();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//Routing EndPoint
app.use('/api', authroutes);
app.use('/api/recpie');

//Testing link
app.get('/', (req, res) => {
  res.send(`Welcome to Mother's Recipe🍪`);
});

//Port Link
app.listen(PORT, () => {
  console.log(`Server Started on ${PORT}`);
});