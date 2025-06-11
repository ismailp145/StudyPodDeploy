import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';

// Instantiate winkNLP.
const nlp = winkNLP(model);
// Obtain "its" helper to extract item properties.
const its = nlp.its;
// Obtain "as" reducer helper to reduce a collection.
const as = nlp.as;


export function filterKeywords(text:string){
  const generic = new Set([
    'difference','compare','comparison','podcast', 
    'make', 'generate', 'you', 'can', 'produce', 'me',
  ]);
  return winkNLP(model)
         .readDoc(text)
         .tokens()
         .filter(t => ['NOUN','PROPN'].includes(t.out(its.pos)))
         .out()
         .filter(w => !generic.has(w)); 
}
