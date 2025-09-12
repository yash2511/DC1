import { generateEnhancedASCIIChart } from './chart-generator.js';

// Test with sample price data
const sampleData = [
  {price: 25000}, {price: 24500}, {price: 24800}, 
  {price: 23900}, {price: 23500}, {price: 22999},
  {price: 23200}, {price: 22800}, {price: 22500}
];

console.log('🧪 Testing Enhanced ASCII Chart:\n');
console.log(generateEnhancedASCIIChart(sampleData, 'iPhone 15 Pro'));