// Launcher: changes cwd to rantr project, then starts rantr's vite dev server
import { chdir } from 'process'
chdir('C:/Users/ajink/OneDrive/Documents/rantr')
await import('file:///C:/Users/ajink/OneDrive/Documents/rantr/node_modules/vite/bin/vite.js')
