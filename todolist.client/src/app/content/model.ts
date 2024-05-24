export class Category {
  public CategoryID?: number;
  public CategoryName?: string;
  public Description?: string;
}

export class Task {
  id?: number;
  name?: string;
  description?: string;
  isComplete?: boolean;
  dueDate?: Date
  //Category?: {
  //  CategoryID: number;
  //  CategoryName: string;
  //  Description?: string;
  //};
}
