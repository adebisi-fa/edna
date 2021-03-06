package main

import (
	"html/template"
	"log"
	"net/http"
	"strings"
)

func (config *Config) RootHandler(w http.ResponseWriter, r *http.Request) {
	log.Println(r.Host)
	h := strings.Split(r.Host, ".")
	log.Println(len(h))
	if h[0] == "www" || len(h) == 2 {
		log.Println("landing page")
		xx := template.New("index.html").Delims("<&", "&>")
		xx, err := xx.ParseFiles("static/index.html")
		if err != nil {
			log.Fatal(err)
		}
		w.Header().Set("Content-Type", "text/html")
		err = xx.ExecuteTemplate(w, "index.html", "")
		if err != nil {
			log.Fatal(err)
		}
	} else {
		log.Println("dashboard")
		tt := template.New("dashboard.html").Delims("<&", "&>")
		tt, err := tt.ParseFiles("static/dashboard.html")
		if err != nil {
			log.Fatal(err)
		}
		w.Header().Set("Content-Type", "text/html")
		err = tt.ExecuteTemplate(w, "dashboard.html", "")
		if err != nil {
			log.Fatal(err)
		}
	}

}
