import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import session from 'express-session';
import passport from 'passport';
// FIXED: Use working server instead of broken index.ts
import './working-server.js';

// Server is now handled by working-server.js