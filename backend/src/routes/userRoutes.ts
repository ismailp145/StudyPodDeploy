import express, { Request, Response, Router } from 'express';
import {User} from '../types/User';


const router: Router = express.Router();


let users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@test.org' },
  { id: 3, name: 'Charlie', email: 'charlie@something.net' },
];

router.get('/users', (req: Request, res: Response) => {
  res.json(users);
});

router.post('/users', (req: Request, res: Response) => {
  const newUser: User = {
    id: Date.now(), // simplistic unique ID
    name: req.body.name,
    email: req.body.email,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

router.delete('/users/:id', (req: Request, res: Response) => {
  const userId = parseInt(req.params.id, 10);
  users = users.filter((user) => user.id !== userId);
  res.status(204).send();
});

export default router;