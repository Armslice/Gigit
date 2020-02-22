import {Template} from 'meteor/templating'
import {DB} from './database.js'
import '../client/main.html'

let deleteID = null;
let editID = null;

let show_completed = true;

Template.body.helpers({
    gigs(){
      if (!show_completed)
      {
        return DB.find({completed:false},{sort: {createdAt: -1}});
      }
      else
      {
        return DB.find({},{sort: {createdAt: -1}});
      }
    }
  });

  Template.gigInput.events({
    'submit .new-gig-form'(event){
        event.preventDefault();
        const form = event.target;
        let reg = parseFloat(form.r_hrs.value);
        let ot = parseFloat(form.ot_hrs.value);
        let dt = parseFloat(form.dt_hrs.value);
        reg = (reg)? reg:0;
        ot = (ot)? ot:0;
        dt = (dt)? dt:0;
        let gig = {
          name: form.name.value,
          dates: form.dates.value,
          payroll: form.payroll.value,
          r_hrs: reg,
          ot_hrs: ot,
          dt_hrs: dt,
          rate: form.rate.value,
          notes: form.notes.value,
          pay: (reg+ot*1.5+dt*2)*parseFloat(form.rate.value),
        };

        if (editID){
          DB.update(editID,{$set: gig})
          closeEditor();
        }
        else{
          gig.completed = gig.billed = gig.paid= gig.deposited = false;
          gig.createdAt = new Date();
          DB.insert(gig);
        }
        form.reset()
    },
  }
  )
  
  Template.gig.events({
    'click .completed'(){
      DB.update(this._id, {$set: {completed: !this.completed},});
    },
    'click .billed'(){
      DB.update(this._id, {$set: {billed: !this.billed},});;
    },
    'click .paid'(){
      DB.update(this._id, {$set: {paid: !this.paid},});;
    },
    'click .deposited'(){
      DB.update(this._id, {$set: {deposited: !this.deposited},});;
    },
    'click .delete'(){
      deleteID = this._id;
      document.getElementById('confirmModal').style.display = "grid";
    },
    'click .edit'(){
      form = document.getElementById('editForm');
      data = DB.findOne(this._id);
      form.name.value= data.name;
      form.dates.value= data.dates;
      form.payroll.value = (data.payroll)? data.payroll:"";
      form.r_hrs.value = data.r_hrs;
      form.ot_hrs.value = data.ot_hrs;
      form.dt_hrs.value = data.dt_hrs;
      form.rate.value = data.rate;
      form.notes.value = data.notes;
      editID = this._id;
      document.getElementById('editModal').style.display = "grid";

    }
  });

  Template.body.events({
    'click .yesDelete'(){
      DB.remove(deleteID)
      document.getElementById('confirmModal').style.display = "none";
    },
    'click .cancelDelete'(){
      deleteID = null;
      document.getElementById('confirmModal').style.display = "none";
    },
    'click .cancelEdit'(){
      closeEditor();
    },
    'click .info-btn'(event){
      document.getElementById("infoModal").style.display = "grid";
      var unpaid = DB.find({paid:false})
      var unpaid_total = 0;
      unpaid.forEach((c,i,a)=>{
        unpaid_total += c.pay;
      })
      var undeposited = DB.find({deposited:false})
      var undeposited_total = 0;
      undeposited.forEach((c,i,a)=>{
        undeposited_total += c.pay;
      })
      document.getElementById("information").innerHTML = "Unpaid: "+unpaid_total+
      "<br>Undeposited: "+undeposited_total
    },
    'click .closeInfo'(){
      document.getElementById("infoModal").style.display = "none";
    }
  });

  const closeEditor= ()=>{
    editID = null;
    document.getElementById('editModal').style.display = "none"
  };

  function doSomething(){
    alert("ALERT!!!");
  }