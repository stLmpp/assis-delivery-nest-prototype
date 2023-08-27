module.exports = {
  SWC_DEFAULT: () => ({
    $schema: 'https://json.schemastore.org/swcrc',
    sourceMaps: true,
    minify: false,
    jsc: {
      minify: {
        compress: {
          unused: true,
        },
      },
      transform: {
        optimizer: {
          globals: {
            vars: {
              DEV_MODE: 'false',
            },
          },
        },
      },
    },
  }),
};
