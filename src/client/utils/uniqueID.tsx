const baseRadix = 36;
export const uniqueId = () =>
  Math.random()
    .toString(baseRadix)
    .slice(2);

export default uniqueId;
