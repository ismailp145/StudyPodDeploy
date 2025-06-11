import { filterKeywords } from './keywordService';

describe('filterKeywords', () => {
  it('should filter out generic words and return only relevant nouns', () => {
    const text = "Can you make a podcast about the difference between alligators and crocodiles?";
    const result = filterKeywords(text);
    
    expect(result).toContain('alligators');
    expect(result).toContain('crocodiles');
    expect(result).not.toContain('difference');
    expect(result).not.toContain('podcast');
    expect(result).not.toContain('difference');

  });

  it('should handle empty text', () => {
    const result = filterKeywords('');
    expect(result).toEqual([]);
  });

  it('should handle text with no relevant keywords', () => {
    const text = "Can you make me a podcast?";
    const result = filterKeywords(text);
    expect(result).toEqual([]);
  });
}); 