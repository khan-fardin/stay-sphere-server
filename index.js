const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MongoDB;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const roomCollection = client.db('roomDB').collection('rooms');
        const bookedRoomCollection = client.db('roomDB').collection('bookedRooms');

        // get all rooms
        app.get('/rooms', async (req, res) => {
            // const cursor = roomCollection.find();
            // const result = await cursor.toArray();
            const result = await roomCollection.find().toArray();
            res.send(result);
        });

        // get room individually
        app.get('/rooms/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await roomCollection.findOne(query);
            res.send(result);
        });

        // get my booked rooms
        app.get("/my-bookings", async (req, res) => {
            const userEmail = req.query.email;
            if (!userEmail) {
                return res.status(400).json({ error: "Email query parameter is required" });
            }
            const result = await roomCollection.find({
                bookingDetails: {
                    $elemMatch: { email: userEmail }
                }
            }).toArray();
            res.send(result);
        });

        // delete user's booking from a room
        app.delete("/my-bookings/:id/booking", async (req, res) => {
            const id = req.params.id;
            const userEmail = req.query.email;

            if (!userEmail) {
                return res.status(400).json({ success: false, message: "Email is required." });
            }
            try {
                const result = await roomCollection.updateOne(
                    { _id: new ObjectId(id) }, // match specific room
                    { $pull: { bookingDetails: { email: userEmail } } } // remove bookings for that email
                );

                if (result.modifiedCount === 1) {
                    res.status(200).json({ success: true, message: "Booking deleted for user in this room." });
                } else {
                    res.status(404).json({ success: false, message: "No matching booking found." });
                }
            } catch (error) {
                console.error("Error deleting room booking:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });

        // update book date
        app.patch('/my-bookings/:id/update-date', async (req, res) => {
            const id = req.params.id;
            const { email, newBookingDate } = req.body;

            if (!email || !newBookingDate) {
                return res.status(400).json({ success: false, message: "Missing email or date." });
            }

            try {
                const result = await roomCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { "bookingDetails.$[elem].bookingDate": newBookingDate } },
                    { arrayFilters: [{ "elem.email": email }] }
                );

                if (result.modifiedCount === 1) {
                    res.json({ success: true, message: "Booking date updated successfully." });
                } else {
                    res.status(404).json({ success: false, message: "Booking not found." });
                }
            } catch (error) {
                console.error("Error updating booking date:", error);
                res.status(500).json({ success: false, message: "Server error" });
            }
        });

        // get reviews by date
        app.get("/latest-reviews", async (req, res) => {
            try {
                const latestReviews = await roomCollection.aggregate([
                    // Step 1: Flatten the reviews array
                    { $unwind: "$bookingDetails" },
                    // Step 2: Shape each result document
                    {
                        $project: {
                            _id: 0,                      // exclude MongoDB ID
                            roomId: "$_id",              // original room ID
                            roomName: "$name",           // assuming rooms have a name field
                            user: "$bookingDetails.name",       // review fields
                            rating: "$bookingDetails.rating",
                            comment: "$bookingDetails.comment",
                            date: "$bookingDetails.commentDate"
                        }
                    },
                    // Step 3: Sort reviews by date descending
                    { $sort: { date: -1 } },
                    // Step 4: Limit to top 10
                    { $limit: 10 }
                ]).toArray();
                res.json(latestReviews);
            } catch (error) {
                console.error("Failed to get latest reviews:", error);
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        // add booking detail to room 
        app.patch("/rooms/:id", async (req, res) => {
            const { id } = req.params;
            const booking = req.body;

            try {
                const result = await roomCollection.updateOne(
                    { _id: new ObjectId(id) },
                    {
                        $push: {
                            bookingDetails: booking
                        }
                    }
                );
                if (result.modifiedCount === 1) {
                    res.status(200).json({ success: true, message: "Room booked successfully." });
                } else {
                    res.status(404).json({ success: false, message: "Room not found." });
                }
            } catch (err) {
                console.error("Error booking room:", err);
                res.status(500).json({ success: false, message: "Internal server error." });
            }
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bhang Bhosda World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})