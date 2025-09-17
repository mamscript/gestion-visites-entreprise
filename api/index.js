// Point d'entrée pour Vercel
const express = require('express');
const path = require('path');

// Import du serveur principal
const app = require('../server');

// Export pour Vercel
module.exports = app;
