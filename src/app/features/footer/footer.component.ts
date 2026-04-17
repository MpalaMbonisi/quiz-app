import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; {{ currentYear }} Quiz App. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        background-color: transparent;
        color: grey;
        margin: auto;

        .footer-content {
          max-width: 1200px;
          margin: 0.5rem auto;

          p {
            text-align: center;
          }

          @media (max-width: 768px) {
            flex-direction: column;
            text-align: center;
          }
        }
      }
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
