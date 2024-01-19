import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isDropdownOpen = false;
  activeDropdown: string | null = null;

  toggleDropdown(dropdown: string) {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.activeDropdown = this.isDropdownOpen ? dropdown : null;
  }
}
