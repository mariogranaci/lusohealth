import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isDropdownOpen = false;
  activeDropdown: string | null = null;

  toggleDropdown(dropdown: string) {
    if (this.activeDropdown === dropdown) {
      this.isDropdownOpen = !this.isDropdownOpen;
    } else {
      this.isDropdownOpen = true;
    }
    this.activeDropdown = dropdown;
  }
}


