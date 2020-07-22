import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxPushapeModule } from 'ngx-pushape';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxPushapeModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
