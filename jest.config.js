module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      isolatedModules: true,
    },
  },
  collectCoverage: true,
  snapshotFormat: {
    printBasicPrototype: false,
  },
  snapshotSerializers: ['<rootDir>/jest-axios-snapshot.ts'],
};
