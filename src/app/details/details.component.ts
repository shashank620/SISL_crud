import { Component, OnInit } from '@angular/core';
import { PeopleService } from '../people.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 3
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, ReactiveFormsModule, CardModule, ButtonModule, DialogModule, InputTextModule, ToastModule, TableModule, ConfirmDialogModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
  providers: [ConfirmationService, MessageService, PeopleService],
})
export class DetailsComponent implements OnInit {

  people: any[] = [];
  personForm: FormGroup;
  displayDialog: boolean = false;
  editingPerson: any;
  error: any


  constructor(
    private peopleService: PeopleService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.personForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]]
    });
  }

  ngOnInit() {
    this.loadPeople();
  }

  loadPeople() {
    this.peopleService.getPeople().subscribe(data => {
      console.log("try", data)
      this.people = data
    });
  }

  openNew() {
    this.personForm.reset();
    this.displayDialog = true;
    this.editingPerson = null;
  }

  editPerson(person: any) {
    this.personForm.patchValue(person);
    console.log(".........", this.personForm.patchValue)
    this.displayDialog = true;
    this.editingPerson = person;
  }

  deletePerson(person: any) {
    console.log("person", person)
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${person.name}?`,
      accept: () => {
        this.peopleService.deletePerson(person.id).subscribe(() => {
          this.loadPeople();
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Person deleted' });
        });
      }
    });
  }

  savePerson() {
    if (this.personForm.invalid) {
      return;
    }
    const person = this.personForm.value;

    if (this.editingPerson) {
      this.peopleService.updatePerson(this.editingPerson.id, person).subscribe(() => {
        this.loadPeople();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Person updated' });
        this.displayDialog = false;
      });
    } else {
      this.peopleService.addPerson(person).subscribe(() => {
        this.loadPeople();
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Person added' });
        this.displayDialog = false;
      });
    }
  }
}
