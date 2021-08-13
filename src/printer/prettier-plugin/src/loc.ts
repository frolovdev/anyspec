export function locStart(node: any) {
  if (typeof node.start === 'number') {
    return node.start;
  }
  return node.loc && node.loc.start;
}

export function locEnd(node: any) {
  if (typeof node.end === 'number') {
    return node.end;
  }
  return node.loc && node.loc.end;
}
