import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'quotes';
  form: FormGroup = new FormGroup({});
  emptyHotelFormGroup: FormGroup = new FormGroup({
    name: new FormControl(),
    singlePrice: new FormGroup({
      price: new FormControl(),
      quantity: new FormControl(1),
    }),
    doublePrice: new FormGroup({
      price: new FormControl(),
      quantity: new FormControl(1),
    }),
    triplePrice: new FormGroup({
      price: new FormControl(),
      quantity: new FormControl(1),
    }),
    kidPrice: new FormControl(),
  });
  quotes: any[] = [];
  dollarPrice: number = 57.5;

  get hotels(): FormArray {
    return this.form.get('hotels') as FormArray;
  }

  getHabPriceFormGroup(index: number, habType: 'singlePrice' | 'doublePrice' | 'triplePrice'): FormGroup {
    const item = (this.form.get('hotels') as FormArray).get([index])
    return item ? item.get(habType) as FormGroup : new FormGroup({});
  }

  parseToFormGroup(item: any): FormGroup {
    return item as FormGroup;
  }


  ngOnInit() {
    this.form = new FormGroup({
      adults: new FormControl(5),
      kids: new FormControl(2),
      nights: new FormControl(2),
      hotels: new FormArray([this.emptyHotelFormGroup] as FormGroup[])
    })
  }

  calculatePrice(price?: number, type: 1 | 2 | 3 | 'k' = 1, quantity: number = 1): number {
    console.log(quantity, 'klk');
    if(!!price) {
      const {nights, adults, kids} = this.form.value;
      return Math.ceil(((price * nights) * (type === 'k' ? kids : type)) * this.dollarPrice) * quantity;
    }
    return 0
  }

  getAdultsPerHab(hab: any, type: 1 | 2 | 3 ): number {
    return (hab.price ? type * hab.quantity: 0);
  }

  submitForm() {
    console.log(this.form.value);
    const {nights, adults, kids} = this.form.value;
    const nf = new Intl.NumberFormat('en-US');

    this.quotes = this.hotels.value.map((hotel: any) => {
      const singlePrice = this.calculatePrice(hotel.singlePrice.price, 1, hotel.singlePrice.quantity);
      const doublePrice = this.calculatePrice(hotel.doublePrice.price, 2, hotel.doublePrice.quantity);
      const triplePrice = this.calculatePrice(hotel.triplePrice.price,3, hotel.triplePrice.quantity);

      const totalAdults = this.getAdultsPerHab(hotel.singlePrice, 1) + this.getAdultsPerHab(hotel.doublePrice, 2) + this.getAdultsPerHab(hotel.triplePrice, 3);
      const singleUnitPrice = singlePrice && Math.ceil(singlePrice / hotel.singlePrice.quantity);
      const doubleUnitPrice = doublePrice && Math.ceil(doublePrice / hotel.doublePrice.quantity);
      const tripleUnitPrice = triplePrice && Math.ceil(triplePrice / hotel.triplePrice.quantity);

      const singleText = singlePrice ?
        `${hotel.singlePrice.quantity} Hab. Sencilla: RD$${nf.format(singleUnitPrice)} x ${hotel.singlePrice.quantity} = RD$${singlePrice} \n`
        : '';

      const doubleText = doublePrice ?
        `${hotel.doublePrice.quantity} Hab. Doble: RD$${nf.format(doubleUnitPrice)} x ${hotel.doublePrice.quantity} = RD$${doublePrice} \n`
        : '';

      const tripleText = triplePrice ?
        `${hotel.triplePrice.quantity} Hab. Triple: RD$${nf.format(tripleUnitPrice)} x ${hotel.triplePrice.quantity} = RD$${triplePrice}`
        : '';

      const habText = singleText + doubleText + tripleText;

      const adultP = singlePrice + doublePrice + triplePrice;
      const kidP = this.calculatePrice(hotel.kidPrice, 'k');
      const data: any = {
        adultPrice: `RD$${nf.format(adultP)}`,
        kidPrice: kidP ? `RD$${nf.format(kidP)}` : undefined,
        total: `RD$${nf.format(kidP + adultP)}`,
        hotel: hotel.name,
        adults: totalAdults,
        singlePrice,
        doublePrice,
        triplePrice,
        singleText,
        doubleText,
        tripleText,
        nights,
        kids,
        textToCopy: `
*${hotel.name}*
_Total: RD$${nf.format(kidP + adultP)}_
Adultos: ${totalAdults} - RD$${nf.format(adultP)}${kidP ? '\nNiños: ' + kids +' - ' +'RD$' + nf.format(kidP) : ''}
${habText}`,
      };

      console.log(data.textToCopy);
      return data;
    });
  }

  copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  copyAllQuotes() {
    const text = this.quotes.map(item => item.textToCopy).join('');

    this.copyText(text);
  }


  addHotel() {
    this.hotels.push(new FormGroup({
      name: new FormControl(),
      singlePrice: new FormGroup({
        price: new FormControl(),
        quantity: new FormControl(1),
      }),
      doublePrice: new FormGroup({
        price: new FormControl(),
        quantity: new FormControl(1),
      }),
      triplePrice: new FormGroup({
        price: new FormControl(),
        quantity: new FormControl(1),
      }),
      kidPrice: new FormControl(),
    }));
  }


  removeQuote(index: number) {
    this.quotes = this.quotes.filter((item, i) => i !== index);
  }

  removeHotel(i: number) {
    this.hotels.removeAt(i);
  }
}
