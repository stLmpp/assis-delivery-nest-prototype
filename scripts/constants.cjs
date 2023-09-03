module.exports = {
  SWC_DEFAULT: () => ({
    $schema: 'https://json.schemastore.org/swcrc',
    sourceMaps: true,
    minify: false,
    jsc: {
      parser: {
        syntax: 'typescript',
        decorators: true,
        dynamicImport: true,
      },
      minify: {
        compress: {
          unused: true,
        },
      },
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
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
