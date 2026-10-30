// Presentation hints only: these labels never affect pantry matching or amounts.
export const aisles=['Produce','Meat & seafood','Dairy & eggs','Bakery','Rice, pasta & canned goods','Sauces, spices & baking','Other / review'];
export function shoppingAisle(name){
 const text=String(name).toLowerCase();
 const patterns=[/\b(?:onion|garlic|broccoli|carrot|pepper|tomato|potato|lettuce|cabbage|collard|kale|spinach|lemon|lime|avocado|cilantro|parsley|basil|dill|zucchini|squash|jalapeño|radish|mushroom|green bean|fruit)\b/,/\b(?:chicken|beef|steak|pork|sausage|kielbasa|venison|shrimp|fish|salmon)\b/,/\b(?:milk|cream|cheese|feta|yogurt|butter|egg|provolone|oaxaca)\b/,/\b(?:bread|tortilla|pita|tostada)\b/,/\b(?:rice|pasta|rigatoni|bean|broth|stock|canned|can of)\b/,/\b(?:oil|vinegar|sauce|gochujang|paste|sugar|honey|flour|salt|pepper|cumin|oregano|paprika|spice|yeast|sesame)\b/];
 // Prepared sauces/seasonings belong together even when their name contains produce/meat.
 if(/\b(?:sauce|paste|broth|stock|powder|dried|vinegar|oil|juice|black pepper|white pepper)\b/.test(text))return /\b(?:broth|stock)\b/.test(text)?aisles[4]:aisles[5];
 const i=patterns.findIndex(p=>p.test(text));return aisles[i<0?6:i];
}
