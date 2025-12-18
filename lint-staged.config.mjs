export default {
  '*.ts': ['prettier --write', () => 'tsc --noEmit', 'eslint --fix'],
};
