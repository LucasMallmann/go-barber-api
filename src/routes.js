import Router from 'express';

import multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

// Middlewares
import authMiddleware from './app/middlewares/auth';

// Multer
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.get('/', async (req, res) => res.json({ message: 'okay' }));
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

// Upload files
routes.post('/files', upload.single('file'), (req, res) => res.json('ok'));

export default routes;
