#!/bin/sh

# update copyright notices

files=$(find src \( -name '*.css' -o -name '*.js' -o -name '*.tsx' \) )

perl -ni -e '
BEGIN {
    $licence = <<EOT;
/*
 *  #%L
 *  com.paremus.ui-client
 *  %%
 *  Copyright (C) 2018 - 2020 Paremus Ltd
 *  %%
 *  Licensed under the Fair Source License, Version 0.9 (the "License");
 *
 *  See the NOTICE.txt file distributed with this work for additional
 *  information regarding copyright ownership. You may not use this file
 *  except in compliance with the License. For usage restrictions see the
 *  LICENSE.txt file distributed with this work
 *  #L%
 */
EOT
}
  if ($ARGV ne $file) {
    $file = $ARGV;
    $done = !m!^/[*]!;
    print $licence if ($done);
    $header = "";
  }


  if ($done) {
    print;
    next;
  }

  $header .= $_;

  if ($header =~ m! #%L.* #L%.* [*]/!s) {
    print $licence;
    $done = 1;
  }
  elsif (eof) {
    print $licence;
    print "EOF\n";
    print $header;
  }
' ${*:-$files}


#
