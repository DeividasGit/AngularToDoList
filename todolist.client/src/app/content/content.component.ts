import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Task } from "./model";
import { HttpClient } from '@angular/common/http';
import { RowClassArgs } from "@progress/kendo-angular-grid";
import { SortDescriptor, orderBy } from "@progress/kendo-data-query";
import { process } from "@progress/kendo-data-query";
import { DataBindingDirective } from "@progress/kendo-angular-grid";
import { SVGIcon, fileAddIcon, editToolsIcon, tableRowDeleteIcon } from "@progress/kendo-svg-icons";


@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-content',
  styleUrl: './content.component.css',
  templateUrl: './content.component.html', 
})

export class ContentComponent implements OnInit {
  @ViewChild(DataBindingDirective) dataBinding!: DataBindingDirective;
  @Input() selectedItem!: string;

  public addSVG: SVGIcon = fileAddIcon;
  public editSVG: SVGIcon = editToolsIcon;
  public deleteSVG: SVGIcon = tableRowDeleteIcon;

  public tasks: Task[] = [];
  public tasksData: Task[] = [];

  public taskDialogOpened = false;
  public deleteDialogOpened = false;

  public name: string = '';
  public description: string = '';
  public id: number = -1;
  public isComplete = false;

  public sort: SortDescriptor[] = [
    {
      field: "isComplete",
      dir: "asc",
    },
  ];
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getTasks();
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
  public async saveTaskDialog(status: string, name: string, description: string): Promise<void> {
    console.log(`Task Dialog result: ${status}`);
    console.log(`Name: ${name}`);
    console.log(`Description: ${description}`);

    if (status == 'cancel') {
      this.taskDialogOpened = false;
      return;
    }

    let task = new Task();
    task.name = this.name;
    task.description = this.description;
    task.isComplete = this.isComplete;

    if (this.id != -1) {
      task.id = this.id

      await this.updateTask(task);

      const index = this.tasks.findIndex(({ id }) => id === this.id);
      const indexData = this.tasksData.findIndex(({ id }) => id === this.id);

      if (index != -1) {
        this.tasks[index].name = this.name;
        this.tasks[index].description = this.description;
        this.tasks[index].isComplete = this.isComplete;

        this.tasksData[indexData].name = this.name;
        this.tasksData[indexData].description = this.description;
        this.tasksData[indexData].isComplete = this.isComplete;
      }
    } else {
      await this.addTask(task);

      task.id = this.id;

      this.tasks.push(task);
      this.tasksData.push(task);
    }

    this.dataBinding.skip = 0;
    this.tasks = this.tasks.slice(0);

    this.taskDialogOpened = false;

    this.name = '';
    this.description = '';
    this.id = -1;
    this.isComplete = false;
  }
  public async deleteTaskDialog(status: string) {
    console.log(`Delete Dialog result: ${status}`);

    if (status == 'yes') {
      await this.deleteTask(this.id);
    }

    const index = this.tasks.findIndex(({ id }) => id === this.id);
    const indexData = this.tasksData.findIndex(({ id }) => id === this.id);

    if (index != -1) {
      this.tasks.splice(index, 1);
      this.tasksData.splice(indexData, 1);
    }

    this.dataBinding.skip = 0;
    this.tasks = this.tasks.slice(0);

    this.deleteDialogOpened = false;
    this.id = -1;
  }

  public add(): void {
    this.taskDialogOpened = true;
  }
  public edit(task: Task) {
    this.name = task.name!;
    this.description = task.description!;
    this.id = task.id!;
    this.isComplete = task.isComplete!;

    this.taskDialogOpened = true;
  }
  public delete(task: Task) {
    this.deleteDialogOpened = true;

    this.id = task.id!;
  }

  getTasks() {
    this.http.get<Task[]>('/task').subscribe(
      (result) => {
        this.tasks = result;
        this.tasksData = this.tasks;
      },
      (error) => {
        console.error(error);
      }
    );   
  }
  async updateTask(task: Task) {

    const response = await this.http.put<Task>('/task/' + task.id, task).toPromise();
  }
  async addTask(task: Task) {

    const response = await this.http.post<Task>('/task', task).toPromise();

    this.id = response!.id!;

    console.log('Returned ID: ' + response!.id!);
  }
  async deleteTask(id: number) {
    const response = await this.http.delete<Task>('/task/' + id).toPromise();
  }

}
