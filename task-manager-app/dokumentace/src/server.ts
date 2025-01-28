import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as YAML from 'yamljs';
import path from 'path';

const app = express();
const PORT = 3005;

// Middleware pro parsování JSON těla požadavků
app.use(express.json());

// Cesta k OpenAPI specifikaci
const swaggerDocument = YAML.load('./src/openapi.yaml');
// Nastavení Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Přesměrování kořenové cesty na Swagger UI
app.get('/', (req, res) => {
    res.redirect('/swagger');
});

// Spuštění serveru
app.listen(PORT, () => {
    console.log(`Swagger dokumentace běží na http://localhost:${PORT}/swagger`);
});
