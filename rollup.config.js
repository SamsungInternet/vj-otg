// rollup.config.js
import 'rollup';

export default {
	output: {
	  format: 'iife'
  },
	sourcemap: 'public/',
	intro: `
	/* eslint-disable */
	/* THIS IS AN AUTOMATICALLY GENERATED FILE CHANGES WILL NOT BE PRESERVED */
	`,
	plugins: []
};
