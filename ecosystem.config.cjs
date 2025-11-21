module.exports = {
  apps : [
    {
      name: "api",
      script: "server.js",
      instances: "3",
      exec_mode: "cluster",
      args: "--sticky"
    },
    {
      name: "queue-worker",
      script: "src/worker/taskWorker.js",
      instances: 1,
      exec_mode: "fork"
    }
],

  // deploy : {
  //   production : {
  //     user : 'SSH_USERNAME',
  //     host : 'SSH_HOSTMACHINE',
  //     ref  : 'origin/master',
  //     repo : 'GIT_REPOSITORY',
  //     path : 'DESTINATION_PATH',
  //     'pre-deploy-local': '',
  //     'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
  //     'pre-setup': ''
  //   }
  // }
};
