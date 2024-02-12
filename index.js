//API User
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
const UserModel = require('./Model/User')
const cors = require('cors');
app.use(cors());


const jwt = require('jsonwebtoken');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Configuration de Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestion des Utilisateurs',
      version: '1.0.0',
    },
  },
  apis: ['./index.js'], // Spécifiez le chemin vers vos fichiers de routes
};

const swaggerSpec = swaggerJsdoc(options);

// Utilisation de Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//la configuration de la conexion a mon base  avec mongoDB 

const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Formation");
const db = mongoose.connection;
db.on("error", () => {
  console.log("Erreur");
});
db.once("open", () => {
  console.log("Connexion avec succees");
});
/**
 * @swagger
 * /user/lister:
 *   get:
 *     summary: Liste tous les utilisateurs
 *     description: Récupère la liste complète des utilisateurs.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               liste: [{nom: 'John', prenom: 'Doe'}, {nom: 'Jane', prenom: 'Smith'}]
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Erreur interne du serveur.'
 */
//c est les API de CRUD 
// Ajouter user
app.get('/user/lister', async (req, res) => {
    try {
    // Les traitements nécessaires pour lister les users
    const liste = await UserModel.find({}).exec();
    return res.status(200).json({ success: true, liste });
    } catch (err) { 
    console.error(err);
    return res.status(500).json({ success: false, message: 'Erreur interne duserveur.' });
    }
    });
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestion des utilisateurs
 */

/**
 * @swagger
 * /user/ajouter:
 *   post:
 *     summary: Ajouter un utilisateur
 *     description: Ajoute un nouvel utilisateur avec les informations fournies.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nom: John
 *             prenom: Doe
 *             email: john.doe@example.com
 *             telephone: 1234567890
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             example:
 *               message: "Utilisateur ajouté avec succès : {nom: 'John', prenom: 'Doe'}"
 *       400:
 *         description: Échec de l'ajout
 *         content:
 *           application/json:
 *             example:
 *               message: "Le user n'est pas ajouté ! Erreur : {erreur détaillée}"
 */
   
app.post("/user/ajouter", async (req, res) => {
    try {
        console.log("Requête reçue :", req.body);
        const { nom, prenom, email, telephone } = req.body;

        // Validation des données
        if (!nom || !prenom || !email || !telephone) {
            return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
        }

        const newUser = new UserModel({ nom, prenom, email, telephone });

        // Enregistrement de l'utilisateur dans la base de données
        const savedUser = await newUser.save();

        return res.status(200).json({ success: true, message: "Utilisateur ajouté avec succès.", user: savedUser });
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'utilisateur :", error);
        return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
});




/**
 * @swagger
 * /user/{id}/modifier:
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Modifie les informations d'un utilisateur existant.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de l'utilisateur à modifier.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             nom: NouveauNom
 *             telephone: NouveauNumero
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               UserUpdated: {nom: 'NouveauNom', prenom: 'PrenomActuel', ...}
 *       400:
 *         description: Les champs requis sont manquants
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Les champs "nom" et "telephone" sont requis pour la modification.'
 *       404:
 *         description: Aucun utilisateur trouvé avec cet ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Aucun user trouvé avec cet ID.'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Erreur interne du serveur.'
 */
  app.put('/user/:id/modifier',   async (req, res) => {
    try { 
    const { nom, telephone } = req.body; // Utilisation de req.query pour récupére les paramètres de la requête
  
    // Les traitements nécessaires pour modifier un user
  const UserUpdated = await UserModel.findByIdAndUpdate(  
    req.params.id,
    { nom, telephone }, 
    { new: true, runValidators: true }
    ).exec();
    if (!UserUpdated) {
    return res.status(404).json({ success: false, message: 'Aucun user trouvé avec cet ID.' });
    }
    return res.status(200).json({ success: true, UserUpdated });
    } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Erreur interne du  serveur.' });
    }
    });
    /**
 * @swagger
 * /user/{id}/supprimer:
 *   get:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un utilisateur en fonction de son ID.
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: L'ID de l'utilisateur à supprimer.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               userDeleted: {nom: 'NomSupprimé', prenom: 'PrenomSupprimé', ...}
 *       404:
 *         description: Aucun utilisateur trouvé avec cet ID
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Aucun user trouvé avec cet ID.'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Erreur interne du serveur.'
 */
    app.get('/user/:id/supprimer', async (req, res) => {
        try {
        // Les traitements nécessaires pour supprimer un user
        const userDeleted = await
        UserModel.findByIdAndDelete(req.params.id).exec(); 
        if (!userDeleted) {
        return res.status(404).json({ success: false, message: 'Aucun user trouvé avec cet ID.' });
        }
        return res.status(200).json({ success: true, userDeleted });
        } catch (err) { 
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
        }
        });
        /**
 * @swagger
 * /user/rechercher:
 *   get:
 *     summary: Rechercher des utilisateurs
 *     description: Recherche des utilisateurs en fonction du nom et/ou du numéro de téléphone.
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: nom
 *         description: Le nom de l'utilisateur à rechercher (insensible à la casse).
 *         schema:
 *           type: string
 *       - in: query
 *         name: telephone
 *         description: Le numéro de téléphone de l'utilisateur à rechercher (insensible à la casse).
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               resultatsRecherche: [{nom: 'John', prenom: 'Doe'}, {nom: 'Jane', prenom: 'Smith'}]
 *       400:
 *         description: Le nom ou le numéro de téléphone est requis pour la recherche
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Le nom ou le numéro de téléphone est requis pour la recherche.'
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: 'Erreur interne du serveur.'
 */

        app.get('/user/rechercher' , async (req, res) => {
            try {
            const { nom, telephone } = req.query;
            if (!nom && !telephone) {
            return res.status(400).json({ message: 'Le nom ou le numéro de téléphone est requis pour la recherche.' });
            }let rechercheParams = {};
            if (nom) {
            rechercheParams.nom = { $regex: new RegExp(nom, 'i') }; // Recherch insensible à la casse
            }
            if (telephone) {  
              rechercheParams.telephone = { $regex: new RegExp(telephone, 'i') };
            }
            //find 
            const resultatsRecherche = await UserModel.find(rechercheParams).exec();
            return res.status(200).json(resultatsRecherche);
            } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Erreur interne du serveur.' });
            }
            });

            /**
 * @swagger
 * /login:
 *   post:
 *     summary: Authentification
 *     description: Authentification de l'utilisateur et génération d'un jeton JWT.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             username: utilisateur
 *             password: motdepasse
 *     responses:
 *       200:
 *         description: Succès de l'authentification
 *         content:
 *           application/json:
 *             example:
 *               token: "votre-jeton-jwt"
 *               message: "L'authentification a réussi"
 *       401:
 *         description: Échec de l'authentification
 *         content:
 *           application/json:
 *             example:
 *               message: "L'authentification a échoué"
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             example:
 *               message: "Erreur interne du serveur."
 */

            //partie sécurisé Notre  API 
 // Clé secrète pour la création et la vérification des JWT
const secretKey = process.env.SECRET_KEY || 'votreclésecrete'; // Utilisation d'unevariable d'environnement
// Messages constants
const ERROR_MESSAGE = 'L\'authentification a échoué';
const SUCCESS_MESSAGE = 'L\'authentification a réussi';
// Middleware pour analyser le corps des requêtes au format JSON
app.use(bodyParser.json());
// Middleware pour gérer l'authentification
app.post('/login', (req, res) => {
try {
const { username, password } = req.body;
// Validation des champs requis
if (!username || !password) {
throw new Error('Les champs "username" et "password" sont requis.');
}
// Si l'authentification réussit, vous pouvez générer un JWT
if (username === 'utilisateur' && password === 'motdepasse') {
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token, message: SUCCESS_MESSAGE });
    } else {
    res.status(401).json({ message: ERROR_MESSAGE });
    }
    } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
    });



app.listen(3000, () => {
  console.log(`Serveur demarré http:localhost:${port}`);
});