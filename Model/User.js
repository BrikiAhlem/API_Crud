const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    nom: {
        type: String,
       
        trim: true,
        unique:true
    },
   
    prenom: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },

    telephone: {
        type: String,
       
        validate: {
            validator: function (value) {
                // Exemple : Valider que le numéro de téléphone est un format valide
                return /^\d{8}$/.test(value);
            },
            message: 'Le numéro de téléphone doit contenir 8 chiffres.'
        },
    }
}, {
    timestamps: true,
// Index unique sur le champ "nom" (ajuster si nécessaire)

});
module.exports = mongoose.model('User', UserSchema)