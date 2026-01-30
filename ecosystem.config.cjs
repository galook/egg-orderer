module.exports = {
  apps: [
    {
      name: 'EggOrderer',
      port: '31287',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
    },
  ],
}
