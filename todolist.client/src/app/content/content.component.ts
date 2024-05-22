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

  public opened = false;
  public deleteOpened = false;

  public name: string = '';
  public description: string = '';
  public id: number = -1;
  public isComplete = false;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getTasks();
  }

  public onFilter(value: Event): void {
    const inputValue = value;

    this.tasks = process(this.tasks, {
      filter: {
        logic: "or",
        filters: [
          {
            field: "id",
            operator: "contains",
            value: inputValue,
          },
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

  getTasks() {
    this.http.get<Task[]>('/task').subscribe(
      (result) => {
        this.tasks = result;
      },
      (error) => {
        console.error(error);
      }
    );   
  }
  updateTask(task: Task) {
    this.http.put<Task>('/task/' + task.id, task).subscribe(
      (error) => {
        console.error(error);
      }
    );
  }
  addTask(task: Task) {
    this.http.post<Task>('/task', task).subscribe(
      (error) => {
        console.error(error);
      }
    );
  }
  deleteTask(id: number) {
    this.http.delete<Task>('/task/' + id).subscribe(
      (error) => {
        console.error(error);
      }
    );
  }

  onChange(event: Event, task : Task) {
    const isChecked = (<HTMLInputElement>event.target).checked;
    console.log(isChecked);

    task.isComplete = isChecked;

    this.updateTask(task);
  }

  public rowCallback = (context: RowClassArgs) => {
    if (context.dataItem.isComplete == true) {
      return { green: true  };
    } else {
      return { green: false };
    }
  };
   
  public sort: SortDescriptor[] = [
    {
      field: "isComplete",
      dir: "asc",
    },
  ];

  public save(status: string, name: string, description: string): void {
    console.log(`Dialog result: ${status}`);
    console.log(`Name: ${name}`);
    console.log(`Description: ${description}`);

    let task = new Task()
    task.name = this.name;
    task.description = this.description;
    task.isComplete = this.isComplete;

    if (this.id != -1) {
      task.id = this.id

      this.updateTask(task);
    } else {
      this.addTask(task);

      this.tasks.push(task);
      this.dataBinding.skip = 0;
    }

    this.opened = false;

    this.name = '';
    this.description = '';
    this.id = -1;
    this.isComplete = false;
  }

  public add(): void {
    this.opened = true;
  }

  public edit(task: Task) {
    this.name = task.name!;
    this.description = task.description!;
    this.id = task.id!;
    this.isComplete = task.isComplete!;

    this.opened = true;
  }

  public delete(task: Task) {
    this.deleteOpened = true;

    this.id = task.id!;
  }

  public deleteAction(status: string) {
    console.log(`Delete Dialog result: ${status}`);

    if (status == 'yes') {
      this.deleteTask(this.id);
    }

    this.deleteOpened = false;
    this.id = -1;
  }

}
