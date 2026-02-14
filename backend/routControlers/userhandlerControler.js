import Conversation from "../Models/conversationModels.js";
import User from "../Models/userModels.js";

export const getUserBySearch = async (req, res) => {
    try {
        const search = req.query.search || '';
        const currentUserID = req.user._id;
        const user = await User.find({
            $and: [
                {
                    $or: [
                        { username: { $regex: '.*' + search + '.*', $options: 'i' } },
                        { fullname: { $regex: '.*' + search + '.*', $options: 'i' } }
                    ]
                }, {
                    _id: { $ne: currentUserID }
                }
            ]
        }).select("-password").select("email")

        res.status(200).send(user)

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(error);
    }
}


export const getCorrentChatters = async (req, res) => {
    try {
        const currentUserID = req.user._id;
        const currenTChatters = await Conversation.find({
            participants: currentUserID
        }).sort({
            updatedAt: -1
        });

        if (!currenTChatters || currenTChatters.length === 0) return res.status(200).send([]);

        const partcipantsIDS = currenTChatters.reduce((ids, conversation) => {
            const otherParticipents = conversation.participants.filter(id => id !== currentUserID);
            return [...ids, ...otherParticipents]
        }, [])

        const otherParticipentsIDS = partcipantsIDS.filter(id => id.toString() !== currentUserID.toString());

        const user = await User.find({ _id: { $in: otherParticipentsIDS } }).select("-password").select("-email");

        const users = otherParticipentsIDS.map(id => user.find(user => user._id.toString() === id.toString()));

        res.status(200).send(users)

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(error);
    }
}

/*const currentChatters = await Conversation.find({
  participants: currentUserID
}).sort({
  updatedAt: -1

});






Searches the Conversation collection for chats where the current user is a participant.
Conversation.find({ participants: currentUserID })
So every conversation document has a field called participants, which is an array of user IDs.
Sorts by updatedAt in descending order → most recent chats come first.

*/

/*
const otherParticipantsIDS = partcipantsIDS.filter(id => id.toString() !== currentUserID.toString());
partcipantsIDS: This is the array you built earlier using reduce, which contains all participant IDs from conversations (including duplicates and possibly your own ID).

.filter(...): Loops through each id in that array.

id.toString() !== currentUserID.toString(): Ensures that the current user’s ID is excluded.

.toString() is used because MongoDB ObjectIds are objects, not plain strings. Comparing them directly can fail, so converting both sides to strings makes the comparison safe.

✅ Result: otherParticipantsIDS is an array of only the other use



const user = await User.find({ _id: { $in: otherParticipantsIDS } }).select("-password").select("-email");


User.find(...): Queries the User collection in MongoDB.

{ _id: { $in: otherParticipantsIDS } }: Finds all users whose _id is in the list of otherParticipantsIDS.

$in means “match any value in this array.”

.select("-password").select("-email"): Excludes sensitive fields from the result.

-password → don’t return the password hash.

-email → don’t return the email.

✅ Result: user is an array of user objects for all the other participants, but stripped of sensitive info.



Line 3: Mapping IDs back to user objects

const users = otherParticipantsIDS.map(id => user.find(user => user._id.toString() === id.toString()));


otherParticipantsIDS when building the final users array.

.map(...): Loops through each id in otherParticipantsIDS.

user.find(...): Inside the loop, it searches the user array (from MongoDB) for the user object whose _id matches the current id.

.toString(): Again used to safely compare ObjectIds.

✅ Result: users becomes an array of user objects, ordered exactly like otherParticipantsIDS.


currentUserID = "123";
partcipantsIDS = ["456", "789", "123", "456"];
Filter out current user

otherParticipantsIDS = ["456", "789", "456"];


Find users MongoDB returns:
user = [
  { _id: "456", username: "Alice" },
  { _id: "789", username: "Bob" }
];
Map IDs to user objects

For "456" → finds Alice

For "789" → finds Bob

For "456" again → finds Alice again

users = [
  { _id: "456", username: "Alice" },
  { _id: "789", username: "Bob" },
  { _id: "456", username: "Alice" }
];



*/


