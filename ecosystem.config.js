module.exports = {
  apps: [
    // First application
    {
      name: 'rx-api',
      script: './bin/www.js',
      watch: false,
      instances: 'max',
      exec_mode: 'cluster',
      ignore_watch: ['node_modules', 'public', 'log', 'docs'],
      log_file: 'logs/combine.outerr.log',
      out_file: 'logs/out.log',
      error_file: 'logs/err.log',
      combine_logs: true,
      env: {
      },
    },
    {
      name: 'rx-task',
      script: './task/index.js',
      watch: false,
      // env: env,
      log_file: 'log/task.combine.outerr.log',
      out_file: 'log/task.out.log',
      error_file: 'log/task.err.log',
      combine_logs: true,
    },
  ],
};
