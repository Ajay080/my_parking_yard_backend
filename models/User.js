import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            trim:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            trim:true,
            lowercase:true,
        },
        phone:{
            type: String,
            required: true,
            trim: true,
            validate:{
                validator:function(e){
                    if(e.length<10) return false;
                    return /\d{10}/.test(e); // Validates 10 digit phone number
                }
            }
        },
        password:{
            type: String,
            minLength:6,
            required:true,
        },
        role:{
            type:String,
            enum:["admin", "staff", "user"],
            default:"user"
        }
    },
    {
        timestamps:true,
    }
);


//hash the password before saving
userSchema.pre('save', async function(next){ // Middleware to hash password before saving
    // Only set default role if no role is specified
    if(this.isNew && !this.role) this.role = "user"; // Default role for new users only if not specified        
    if(!this.isModified("password")) return next();
    this.password= await bcrypt.hash(this.password, 10);
    return next();
});


// method to compare the password
userSchema.methods.comparePassword= async function(inputPassword){
    return await bcrypt.compare(inputPassword, this.password); // Compares input password with hashed password  
}

export const User = mongoose.model('User', userSchema, 'user'); // Export the User model