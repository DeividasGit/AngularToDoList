import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentComponent } from './content.component';

describe('ContentComponent', () => {
  let component: ContentComponent;
  let fixture: ComponentFixture<ContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve tasks from the server', () => {
    const mockTasks = [
      { Id: 1, Name: 'TEST1', Description: 'TEST 1 description', IsCompleted: false },
    ];

    component.ngOnInit();

    const req = httpMock.expectOne('/tasks');
    expect(req.request.method).toEqual('GET');
    req.flush(mockTasks);

    expect(component.tasks).toEqual(mockTasks);
  });
});
