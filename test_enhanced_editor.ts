// Test file for enhanced file editor capabilities
export interface TestInterface {
  id: number;
  name: string;
  isActive: boolean;
}

export class TestClass {
  private data: TestInterface[] = [];
  
  constructor() {
    console.log('TestClass initialized');
  }
  
  addItem(item: TestInterface): void {
    this.data.push(item);
  }
  
  getActiveItems(): TestInterface[] {
    return this.data.filter(item => item.isActive);
  }
}

const testInstance = new TestClass();
export default testInstance;