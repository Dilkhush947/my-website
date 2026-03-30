document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("appointmentForm");
  const msg = document.getElementById("formMsg");
  const clearBtn = document.getElementById("clearBtn");

  const dateInput = document.querySelector("input[name='date']");
  const timeSelect = document.querySelector("select[name='time']");

  dateInput.addEventListener("change", async () => {
    const date = dateInput.value;

    const res = await fetch(`/slots?date=${date}`);
    const booked = await res.json();

    const allOptions = Array.from(timeSelect.options);

    allOptions.forEach(opt => opt.disabled = false);

    booked.forEach(b => {
      allOptions.forEach(opt => {
        if (opt.value === b) opt.disabled = true;
      });
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      name: form.name.value,
      phone: form.phone.value,
      email: form.email.value,
      problem: form.problem.value,
      date: form.date.value,
      time: form.time.value
    };

    try {
      const res = await fetch("/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (result.ok) {
        msg.innerText = "Appointment booked successfully";
        msg.style.color = "green";
        form.reset();

        const whatsappMsg = `Name: ${data.name}%0APhone: ${data.phone}%0AProblem: ${data.problem}%0ADate: ${data.date}%0ATime: ${data.time}`;
        window.open(`https://wa.me/919039925667?text=${whatsappMsg}`);

      } else {
        msg.innerText = result.msg;
        msg.style.color = "red";
      }

    } catch {
      msg.innerText = "Server error";
      msg.style.color = "orange";
    }
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    msg.innerText = "";
  });

});