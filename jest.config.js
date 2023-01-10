module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  moduleNameMapper: {
    [/(.+)\.js$/.source]: ['$1.js', '$1.ts'],
  },
  snapshotSerializers: ['<rootDir>/jest-axios-snapshot.ts'],
};
