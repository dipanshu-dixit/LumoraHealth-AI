import { chatMessageSchema, validate } from './middleware/validation.js';

console.log('🧪 Testing Zod Validation...\n');

// Test 1: Valid message
try {
  const valid = validate(chatMessageSchema, { message: 'I have a headache' });
  console.log('✅ Test 1 PASSED: Valid message accepted');
  console.log('   Input:', { message: 'I have a headache' });
  console.log('   Output:', valid);
} catch (error) {
  console.log('❌ Test 1 FAILED:', error.message);
}

// Test 2: Empty message
try {
  validate(chatMessageSchema, { message: '' });
  console.log('❌ Test 2 FAILED: Empty message should be rejected');
} catch (error) {
  console.log('✅ Test 2 PASSED: Empty message rejected');
  console.log('   Error:', error.message);
  console.log('   Name:', error.name);
}

// Test 3: Message too long
try {
  validate(chatMessageSchema, { message: 'x'.repeat(2001) });
  console.log('❌ Test 3 FAILED: Long message should be rejected');
} catch (error) {
  console.log('✅ Test 3 PASSED: Long message rejected');
  console.log('   Error:', error.message);
}

// Test 4: Missing message field
try {
  validate(chatMessageSchema, {});
  console.log('❌ Test 4 FAILED: Missing field should be rejected');
} catch (error) {
  console.log('✅ Test 4 PASSED: Missing field rejected');
  console.log('   Error:', error.message);
}

// Test 5: Whitespace trimming
try {
  const trimmed = validate(chatMessageSchema, { message: '  test message  ' });
  console.log('✅ Test 5 PASSED: Whitespace trimmed');
  console.log('   Input:', '  test message  ');
  console.log('   Output:', trimmed.message);
} catch (error) {
  console.log('❌ Test 5 FAILED:', error.message);
}

console.log('\n✅ Zod validation tests complete!');
