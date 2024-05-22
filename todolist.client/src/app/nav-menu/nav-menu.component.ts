import { Component, ViewEncapsulation } from "@angular/core";
import { DrawerItem, DrawerSelectEvent } from "@progress/kendo-angular-layout";

import {
  SVGIcon,
  bellIcon,
  calendarIcon,
  envelopeLinkIcon,
  inboxIcon,
  listUnorderedIcon,
  menuIcon,
  starOutlineIcon,
} from "@progress/kendo-svg-icons";

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: "app-nav-menu",
  styleUrl: './nav-menu.component.css',
  templateUrl: './nav-menu.component.html',
})
export class NavMenuComponent {
  public selected = "Tasks";
  public menuSvg: SVGIcon = menuIcon;

  public items: Array<DrawerItem> = [
    { text: "Tasks", svgIcon: listUnorderedIcon, selected: true },
    { separator: true },
    { text: "Notifications", svgIcon: bellIcon },
    { text: "Calendar", svgIcon: calendarIcon },
    { separator: true },
    { text: "Attachments", svgIcon: envelopeLinkIcon },
    { text: "Favourites", svgIcon: starOutlineIcon },
  ];

  public onSelect(ev: DrawerSelectEvent): void {
    this.selected = ev.item.text;
  }
}
