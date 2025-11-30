// src/lib/db.mock.ts

type DocData = Record<string, any>;

class MockDoc {
  id: string;
  private _data: DocData;

  constructor(id: string, data?: DocData) {
    this.id = id;
    this._data = data || {};
  }

  async get() {
    return {
      exists: !!this._data,
      id: this.id,
      data: () => this._data,
    };
  }

  async set(data: DocData) {
    this._data = data;
    return this;
  }

  async update(data: DocData) {
    this._data = { ...this._data, ...data };
    return this;
  }
}

class MockCollection {
  private docs: Record<string, MockDoc> = {};

  doc(id: string) {
    if (!this.docs[id]) {
      this.docs[id] = new MockDoc(id);
    }
    return this.docs[id];
  }
}

export const db = {
  collections: {} as Record<string, MockCollection>,

  collection(name: string) {
    if (!this.collections[name]) {
      this.collections[name] = new MockCollection();
    }
    return this.collections[name];
  },
};
