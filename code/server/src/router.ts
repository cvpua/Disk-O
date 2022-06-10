import { Router } from 'express';
import { 
    FileEndpoint, 
    AuthEndpoint, 
    TestEndpoint, 
    DirectoryEndpoint, 
    UserEndpoint,
    RoleEndpoint,
    AccessEndpoint
}     
from './controllers';

export const router = Router();

// Place your base routes here
router.use('/api/file', FileEndpoint);
router.use('/api/auth',AuthEndpoint);
router.use('/api/test',TestEndpoint);
router.use('/api/directory',DirectoryEndpoint);
router.use('/api/user',UserEndpoint);
router.use('/api/role',RoleEndpoint);
router.use('/api/access',AccessEndpoint);