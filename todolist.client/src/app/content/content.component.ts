import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Task } from "./model";
import { HttpClient } from '@angular/common/http';
import { RowClassArgs } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { process } from "@progress/kendo-data-query";
import { DataBindingDirective } from "@progress/kendo-angular-grid";
import { SVGIcon, fileAddIcon, editToolsIcon, tableRowDeleteIcon, filePdfIcon, fileExcelIcon } from "@progress/kendo-svg-icons";


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-content',
  styleUrl: './content.component.css',
  templateUrl: './content.component.html', 
})

export class ContentComponent implements OnInit {
  @ViewChild(DataBindingDirective) dataBinding!: DataBindingDirective;
  @Input() selectedItem!: string;

  public mySelection: string[] = [];

  public addSVG: SVGIcon = fileAddIcon;
  public editSVG: SVGIcon = editToolsIcon;
  public deleteSVG: SVGIcon = tableRowDeleteIcon;
  public pdfSVG: SVGIcon = filePdfIcon;
  public excelSVG: SVGIcon = fileExcelIcon;

  public tasks: Task[] = [];
  public tasksData: Task[] = [];
  public taskDialogData: Task = new Task();

  public taskDialogOpened = false;
  public deleteDialogOpened = false;

  public sort: SortDescriptor[] = [
    {
      field: "isComplete",
      dir: "asc",
    },
  ];
  constructor(private http: HttpClient) { }

  async ngOnInit() {
    await this.getTasks();
  }
  public onFilter(value: Event): void {
    const inputValue = value;

    this.tasks = process(this.tasksData, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "name",
            operator: "contains",
            value: inputValue,
          },
          {
            field: "description",
            operator: "contains",
            value: inputValue,
          },
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }
  public rowCallback = (context: RowClassArgs) => {
    if (context.dataItem.isComplete == true) {
      return { green: true };
    } else {
      return { green: false };
    }
  };

  public async onChange(event: Event, task: Task) {
    const isChecked = (<HTMLInputElement>event.target).checked;
    console.log(isChecked);

    task.isComplete = isChecked;

    await this.updateTask(task);
  }
  public async saveTaskDialog(status: string, _dialogData: Task): Promise<void> {
    console.log(`Task Dialog result: ${status}`);
    console.log(`Name: ${_dialogData.name}`);
    console.log(`Description: ${_dialogData.description}`);

    let dialogData: Task = new Task();
    dialogData.name = _dialogData.name;
    dialogData.description = _dialogData.description;
    dialogData.id = _dialogData.id;
    dialogData.isComplete = _dialogData.isComplete;
    dialogData.dueDate = new Date(_dialogData.dueDate!);

    if (status == 'cancel') {
      this.taskDialogOpened = false;

      this.taskDialogData.name = '';
      this.taskDialogData.description = '';
      this.taskDialogData.id = undefined;
      this.taskDialogData.isComplete = false;
      this.taskDialogData.dueDate = undefined;
      return;
    }

    if (dialogData.id != undefined) {
      await this.updateTask(dialogData);

      const index = this.tasks.findIndex(({ id }) => id === dialogData.id);
      const indexData = this.tasksData.findIndex(({ id }) => id === dialogData.id);

      if (index != -1) {
        this.tasks[index].name = dialogData.name;
        this.tasks[index].description = dialogData.description;
        this.tasks[index].isComplete = dialogData.isComplete;
        this.tasks[index].dueDate = new Date(dialogData.dueDate!);

        this.tasksData[indexData].name = dialogData.name;
        this.tasksData[indexData].description = dialogData.description;
        this.tasksData[indexData].isComplete = dialogData.isComplete;
        this.tasksData[indexData].dueDate = new Date(dialogData.dueDate!);
      }
    } else {
      const id = await this.addTask(dialogData);

      dialogData.id = id;

      console.log(dialogData.name);
      console.log(dialogData.id);
      console.log(dialogData.description);

      this.tasks.push(dialogData);
      //this.tasksData.push(dialogData);
    }

    this.dataBinding.skip = 0;
    this.tasks = this.tasks.slice(0);

    this.taskDialogOpened = false;

    this.taskDialogData.name = '';
    this.taskDialogData.description = '';
    this.taskDialogData.id = undefined;
    this.taskDialogData.isComplete = false;
    this.taskDialogData.dueDate = undefined;
  }
  public async deleteTaskDialog(status: string) {
    console.log(`Delete Dialog result: ${status}`);

    if (status == 'yes') {
      await this.deleteTask(this.taskDialogData.id!);
    }

    const index = this.tasks.findIndex(({ id }) => id === this.taskDialogData.id!);
    const indexData = this.tasksData.findIndex(({ id }) => id === this.taskDialogData.id!);

    if (index != -1) {
      this.tasks.splice(index, 1);
      //this.tasksData.splice(indexData, 1);
    }

    this.dataBinding.skip = 0;
    this.tasks = this.tasks.slice(0);

    this.deleteDialogOpened = false;
    this.taskDialogData.id = undefined;
  }
  public saveTaskDialogClose(status: string) {
    this.taskDialogOpened = false;

    this.taskDialogData.name = '';
    this.taskDialogData.description = '';
    this.taskDialogData.id = undefined;
    this.taskDialogData.isComplete = false;
    this.taskDialogData.dueDate = undefined
  }

  public add(): void {
    this.taskDialogOpened = true;

    this.taskDialogData.name = '';
    this.taskDialogData.description = '';
    this.taskDialogData.isComplete = false;
  }
  public edit(task: Task) {
    this.taskDialogData.name = task.name;
    this.taskDialogData.description = task.description;
    this.taskDialogData.id = task.id;
    this.taskDialogData.isComplete = task.isComplete;
    if (task.dueDate != undefined) {
      this.taskDialogData.dueDate = new Date(task.dueDate);
    }
    else {
      this.taskDialogData.dueDate = undefined
    }

    this.taskDialogOpened = true;
  }
  public delete(task: Task) {
    this.deleteDialogOpened = true;

    this.taskDialogData.id = task.id;
  }

  public async getTasks() {
    const response = await this.http.get<Task[]>('/task').toPromise();

    this.tasks = response!;
    this.tasksData = this.tasks;

    //this.http.get<Task[]>('/task').subscribe(
    //  (result) => {
    //    this.tasks = result;
    //    this.tasksData = this.tasks;
    //  },
    //  (error) => {
    //    console.error(error);
    //  }
    //);   
  }
  public async updateTask(task: Task) {

    const response = await this.http.put<Task>('/task/' + task.id, task).toPromise();
  }
  public async addTask(task: Task): Promise<number> {
    const response = await this.http.post<Task>('/task', task).toPromise();

    this.taskDialogData.id = response!.id!;

    console.log('Returned ID: ' + response!.id!);

    return response!.id!;
  }
  public async deleteTask(id: number) {
    const response = await this.http.delete<Task>('/task/' + id).toPromise();
  }

}
