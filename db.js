// Schema is extracted from mongoose.Schema. A Schema in Mongoose defines the structure of documents (records) within a MongoDB collection, specifying fields, types, and validation.

// Note: More precisely, in typical Mongoose code, ObjectId is usually assigned as Schema.Types.ObjectId to define fields that store MongoDB document IDs, commonly for referencing other documents (like foreign keys in relational databases). The ObjectId is a 12-byte unique identifier used by MongoDB to uniquely identify documents.

// ObjectId in this code references mongoose.ObjectId. This is intended to represent the MongoDB ObjectId type, a unique identifier assigned to each document by MongoDB.

const mongoose = require("mongoose")
const Schema = mongoose.Schema;                            
const ObjectId = mongoose.ObjectId; 

// it is like creating an object from a class—the Schema constructor acts like a class here, and 
// userSchema is the created schema object defining the shape of User documents.
const userSchema = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    lastName: String
});

const adminSchema = new Schema({
    email: {type: String, unique: true},
    password: String,
    firstName: String,
    lastName: String
});

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId

});

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
});

const userModel = mongoose.model("user", userSchema)
const adminModel = mongoose.model("admin", adminSchema);
const courseModel = mongoose.model("course", courseSchema);
const purchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports = {
    userModel,
    adminModel,
    courseModel,
    purchaseModel
}

/*
1. Import Mongoose library to interact with MongoDB
2. Extract Schema constructor to define document structures in MongoDB collections
3. Reference MongoDB ObjectId type for unique document identifiers.
4. create userSchema
5. adminSchema
6. courseSchema
7. purchaseSchema
9. create a model and export the module.
*/