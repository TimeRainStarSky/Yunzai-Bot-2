import chalk from 'chalk'
import chokidar from 'chokidar'
import inquirer from 'inquirer'

export const v3Ready = !!(chalk && chokidar && inquirer)