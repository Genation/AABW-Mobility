export interface Suggestion {
  text: string;
  display: string;
  type: string;
  score: number;
}

interface SerializedNode {
  c?: Record<string, SerializedNode>;
  k?: Suggestion[];
}

export interface TrieNode {
  children: Map<string, TrieNode>;
  topK: Suggestion[];
}

function createNode(): TrieNode {
  return { children: new Map(), topK: [] };
}

export function insertTopK(arr: Suggestion[], item: Suggestion): void {
  const existingIdx = arr.findIndex((s) => s.text === item.text);

  if (existingIdx !== -1) {
    if (item.score <= arr[existingIdx].score) return;
    arr.splice(existingIdx, 1);
  }

  let insertIdx = arr.length;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].score < item.score) {
      insertIdx = i;
      break;
    }
  }

  arr.splice(insertIdx, 0, item);

  if (arr.length > 10) {
    arr.pop();
  }
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = createNode();
  }

  insert(prefix: string, suggestion: Suggestion): void {
    if (prefix.length === 0) return;

    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i];
      let child = node.children.get(ch);
      if (!child) {
        child = createNode();
        node.children.set(ch, child);
      }
      node = child;
    }

    insertTopK(node.topK, suggestion);
  }

  search(prefix: string): Suggestion[] {
    if (prefix.length === 0) return [];

    let node = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i];
      const child = node.children.get(ch);
      if (!child) return [];
      node = child;
    }

    return [...node.topK];
  }

  searchFuzzy(prefix: string, maxEdits: number): Suggestion[] {
    if (prefix.length === 0) return [];

    const dedup = new Map<string, Suggestion>();

    const dfs = (node: TrieNode, pos: number, edits: number): void => {
      if (pos >= prefix.length) {
        for (const s of node.topK) {
          const existing = dedup.get(s.text);
          if (!existing || s.score > existing.score) {
            dedup.set(s.text, s);
          }
        }
      }

      if (edits >= maxEdits) {
        if (pos < prefix.length) {
          const ch = prefix[pos];
          const child = node.children.get(ch);
          if (child) {
            dfs(child, pos + 1, edits);
          }
        }
        return;
      }

      if (pos < prefix.length) {
        const ch = prefix[pos];

        const child = node.children.get(ch);
        if (child) {
          dfs(child, pos + 1, edits);
        }

        dfs(node, pos + 1, edits + 1);

        for (const [key, child] of node.children) {
          if (key !== ch) {
            dfs(child, pos + 1, edits + 1);
          }
        }
      }

      for (const child of node.children.values()) {
        dfs(child, pos, edits + 1);
      }
    };

    dfs(this.root, 0, 0);

    const results = Array.from(dedup.values());
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
  }

  toJSON(): string {
    const serialize = (node: TrieNode): SerializedNode => {
      const result: SerializedNode = {};

      if (node.children.size > 0) {
        const childrenObj: Record<string, SerializedNode> = {};
        for (const [key, child] of node.children) {
          childrenObj[key] = serialize(child);
        }
        result.c = childrenObj;
      }

      if (node.topK.length > 0) {
        result.k = node.topK;
      }

      return result;
    };

    return JSON.stringify(serialize(this.root));
  }

  static fromJSON(json: string): Trie {
    const deserialize = (data: SerializedNode): TrieNode => {
      const node = createNode();

      if (data.k) {
        node.topK = data.k;
      }

      if (data.c) {
        for (const [key, childData] of Object.entries(data.c)) {
          node.children.set(key, deserialize(childData));
        }
      }

      return node;
    };

    const trie = new Trie();
    const parsed: SerializedNode = JSON.parse(json);
    trie.root = deserialize(parsed);
    return trie;
  }
}
